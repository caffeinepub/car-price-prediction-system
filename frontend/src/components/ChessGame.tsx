import { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Crown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChessGameProps {
  onBack: () => void;
}

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Square = Piece | null;
type Board = Square[][];

interface GameState {
  board: Board;
  currentTurn: PieceColor;
  selectedSquare: [number, number] | null;
  validMoves: [number, number][];
  enPassantTarget: [number, number] | null;
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  status: 'playing' | 'check' | 'checkmate' | 'stalemate';
  winner: PieceColor | null;
  capturedWhite: Piece[];
  capturedBlack: Piece[];
}

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  const backRank: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

  // Black pieces (top)
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: 'black' };
    board[1][c] = { type: 'P', color: 'black' };
  }

  // White pieces (bottom)
  for (let c = 0; c < 8; c++) {
    board[7][c] = { type: backRank[c], color: 'white' };
    board[6][c] = { type: 'P', color: 'white' };
  }

  return board;
}

function cloneBoard(board: Board): Board {
  return board.map(row => row.map(sq => sq ? { ...sq } : null));
}

function findKing(board: Board, color: PieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'K' && p.color === color) return [r, c];
    }
  }
  return null;
}

function isInBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function isSquareAttackedBy(board: Board, row: number, col: number, attackerColor: PieceColor): boolean {
  // Check pawn attacks
  const pawnDir = attackerColor === 'white' ? 1 : -1;
  for (const dc of [-1, 1]) {
    const pr = row + pawnDir;
    const pc = col + dc;
    if (isInBounds(pr, pc)) {
      const p = board[pr][pc];
      if (p && p.type === 'P' && p.color === attackerColor) return true;
    }
  }

  // Knight attacks
  for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
    const nr = row + dr, nc = col + dc;
    if (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === 'N' && p.color === attackerColor) return true;
    }
  }

  // Rook/Queen (straight lines)
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    let nr = row + dr, nc = col + dc;
    while (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === attackerColor && (p.type === 'R' || p.type === 'Q')) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }

  // Bishop/Queen (diagonals)
  for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
    let nr = row + dr, nc = col + dc;
    while (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === attackerColor && (p.type === 'B' || p.type === 'Q')) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }

  // King attacks
  for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    const nr = row + dr, nc = col + dc;
    if (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === 'K' && p.color === attackerColor) return true;
    }
  }

  return false;
}

function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const opponent: PieceColor = color === 'white' ? 'black' : 'white';
  return isSquareAttackedBy(board, kingPos[0], kingPos[1], opponent);
}

function getRawMoves(
  board: Board,
  row: number,
  col: number,
  enPassantTarget: [number, number] | null,
  castlingRights: GameState['castlingRights']
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const { type, color } = piece;
  const opponent: PieceColor = color === 'white' ? 'black' : 'white';

  if (type === 'P') {
    const dir = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // Forward one
    if (isInBounds(row + dir, col) && !board[row + dir][col]) {
      moves.push([row + dir, col]);
      // Forward two from start
      if (row === startRow && !board[row + 2 * dir][col]) {
        moves.push([row + 2 * dir, col]);
      }
    }

    // Captures
    for (const dc of [-1, 1]) {
      const nr = row + dir, nc = col + dc;
      if (isInBounds(nr, nc)) {
        if (board[nr][nc]?.color === opponent) moves.push([nr, nc]);
        // En passant
        if (enPassantTarget && enPassantTarget[0] === nr && enPassantTarget[1] === nc) {
          moves.push([nr, nc]);
        }
      }
    }
  }

  if (type === 'N') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr = row + dr, nc = col + dc;
      if (isInBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }
  }

  if (type === 'B' || type === 'Q') {
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      let nr = row + dr, nc = col + dc;
      while (isInBounds(nr, nc)) {
        if (board[nr][nc]) {
          if (board[nr][nc]!.color !== color) moves.push([nr, nc]);
          break;
        }
        moves.push([nr, nc]);
        nr += dr; nc += dc;
      }
    }
  }

  if (type === 'R' || type === 'Q') {
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      let nr = row + dr, nc = col + dc;
      while (isInBounds(nr, nc)) {
        if (board[nr][nc]) {
          if (board[nr][nc]!.color !== color) moves.push([nr, nc]);
          break;
        }
        moves.push([nr, nc]);
        nr += dr; nc += dc;
      }
    }
  }

  if (type === 'K') {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      const nr = row + dr, nc = col + dc;
      if (isInBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }

    // Castling
    const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
    const kingRow = color === 'white' ? 7 : 0;
    if (row === kingRow && col === 4 && !isInCheck(board, color)) {
      // King-side
      const kingSide = color === 'white' ? castlingRights.whiteKingSide : castlingRights.blackKingSide;
      if (kingSide && !board[kingRow][5] && !board[kingRow][6]) {
        if (!isSquareAttackedBy(board, kingRow, 5, opponentColor) &&
            !isSquareAttackedBy(board, kingRow, 6, opponentColor)) {
          moves.push([kingRow, 6]);
        }
      }
      // Queen-side
      const queenSide = color === 'white' ? castlingRights.whiteQueenSide : castlingRights.blackQueenSide;
      if (queenSide && !board[kingRow][3] && !board[kingRow][2] && !board[kingRow][1]) {
        if (!isSquareAttackedBy(board, kingRow, 3, opponentColor) &&
            !isSquareAttackedBy(board, kingRow, 2, opponentColor)) {
          moves.push([kingRow, 2]);
        }
      }
    }
  }

  return moves;
}

function getLegalMoves(
  board: Board,
  row: number,
  col: number,
  enPassantTarget: [number, number] | null,
  castlingRights: GameState['castlingRights']
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const rawMoves = getRawMoves(board, row, col, enPassantTarget, castlingRights);
  const legal: [number, number][] = [];

  for (const [nr, nc] of rawMoves) {
    const testBoard = cloneBoard(board);
    // Handle en passant capture
    if (piece.type === 'P' && enPassantTarget && nr === enPassantTarget[0] && nc === enPassantTarget[1]) {
      const capturedPawnRow = piece.color === 'white' ? nr + 1 : nr - 1;
      testBoard[capturedPawnRow][nc] = null;
    }
    testBoard[nr][nc] = testBoard[row][col];
    testBoard[row][col] = null;

    if (!isInCheck(testBoard, piece.color)) {
      legal.push([nr, nc]);
    }
  }

  return legal;
}

function hasAnyLegalMoves(
  board: Board,
  color: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: GameState['castlingRights']
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        const moves = getLegalMoves(board, r, c, enPassantTarget, castlingRights);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

function createInitialState(): GameState {
  return {
    board: createInitialBoard(),
    currentTurn: 'white',
    selectedSquare: null,
    validMoves: [],
    enPassantTarget: null,
    castlingRights: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    status: 'playing',
    winner: null,
    capturedWhite: [],
    capturedBlack: [],
  };
}

export function ChessGame({ onBack }: ChessGameProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialState);

  const handleSquareClick = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.status === 'checkmate' || prev.status === 'stalemate') return prev;

      const { board, currentTurn, selectedSquare, validMoves, enPassantTarget, castlingRights } = prev;
      const clickedPiece = board[row][col];

      // If a square is already selected
      if (selectedSquare) {
        const [selRow, selCol] = selectedSquare;
        const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

        if (isValidMove) {
          // Execute the move
          const newBoard = cloneBoard(board);
          const movingPiece = newBoard[selRow][selCol]!;
          const newCapturedWhite = [...prev.capturedWhite];
          const newCapturedBlack = [...prev.capturedBlack];

          // Capture
          if (newBoard[row][col]) {
            const captured = newBoard[row][col]!;
            if (captured.color === 'white') newCapturedWhite.push(captured);
            else newCapturedBlack.push(captured);
          }

          // En passant capture
          let newEnPassantTarget: [number, number] | null = null;
          if (movingPiece.type === 'P' && enPassantTarget && row === enPassantTarget[0] && col === enPassantTarget[1]) {
            const capturedPawnRow = movingPiece.color === 'white' ? row + 1 : row - 1;
            const epCaptured = newBoard[capturedPawnRow][col]!;
            if (epCaptured.color === 'white') newCapturedWhite.push(epCaptured);
            else newCapturedBlack.push(epCaptured);
            newBoard[capturedPawnRow][col] = null;
          }

          // Set en passant target for double pawn push
          if (movingPiece.type === 'P' && Math.abs(row - selRow) === 2) {
            const epRow = (selRow + row) / 2;
            newEnPassantTarget = [epRow, col];
          }

          // Move piece
          newBoard[row][col] = movingPiece;
          newBoard[selRow][selCol] = null;

          // Pawn promotion (auto-queen)
          if (movingPiece.type === 'P' && (row === 0 || row === 7)) {
            newBoard[row][col] = { type: 'Q', color: movingPiece.color };
          }

          // Castling rook move
          const newCastlingRights = { ...castlingRights };
          if (movingPiece.type === 'K') {
            if (movingPiece.color === 'white') {
              newCastlingRights.whiteKingSide = false;
              newCastlingRights.whiteQueenSide = false;
              // King-side castle
              if (col === 6 && selCol === 4) {
                newBoard[7][5] = newBoard[7][7];
                newBoard[7][7] = null;
              }
              // Queen-side castle
              if (col === 2 && selCol === 4) {
                newBoard[7][3] = newBoard[7][0];
                newBoard[7][0] = null;
              }
            } else {
              newCastlingRights.blackKingSide = false;
              newCastlingRights.blackQueenSide = false;
              if (col === 6 && selCol === 4) {
                newBoard[0][5] = newBoard[0][7];
                newBoard[0][7] = null;
              }
              if (col === 2 && selCol === 4) {
                newBoard[0][3] = newBoard[0][0];
                newBoard[0][0] = null;
              }
            }
          }
          if (movingPiece.type === 'R') {
            if (selRow === 7 && selCol === 7) newCastlingRights.whiteKingSide = false;
            if (selRow === 7 && selCol === 0) newCastlingRights.whiteQueenSide = false;
            if (selRow === 0 && selCol === 7) newCastlingRights.blackKingSide = false;
            if (selRow === 0 && selCol === 0) newCastlingRights.blackQueenSide = false;
          }

          const nextTurn: PieceColor = currentTurn === 'white' ? 'black' : 'white';
          const inCheck = isInCheck(newBoard, nextTurn);
          const anyMoves = hasAnyLegalMoves(newBoard, nextTurn, newEnPassantTarget, newCastlingRights);

          let status: GameState['status'] = 'playing';
          let winner: PieceColor | null = null;

          if (!anyMoves) {
            if (inCheck) {
              status = 'checkmate';
              winner = currentTurn;
            } else {
              status = 'stalemate';
            }
          } else if (inCheck) {
            status = 'check';
          }

          return {
            ...prev,
            board: newBoard,
            currentTurn: nextTurn,
            selectedSquare: null,
            validMoves: [],
            enPassantTarget: newEnPassantTarget,
            castlingRights: newCastlingRights,
            status,
            winner,
            capturedWhite: newCapturedWhite,
            capturedBlack: newCapturedBlack,
          };
        }

        // Clicked on own piece — re-select
        if (clickedPiece && clickedPiece.color === currentTurn) {
          const moves = getLegalMoves(board, row, col, enPassantTarget, castlingRights);
          return { ...prev, selectedSquare: [row, col], validMoves: moves };
        }

        // Deselect
        return { ...prev, selectedSquare: null, validMoves: [] };
      }

      // No selection yet — select own piece
      if (clickedPiece && clickedPiece.color === currentTurn) {
        const moves = getLegalMoves(board, row, col, enPassantTarget, castlingRights);
        return { ...prev, selectedSquare: [row, col], validMoves: moves };
      }

      return prev;
    });
  }, []);

  const handleNewGame = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const { board, currentTurn, selectedSquare, validMoves, status, winner, capturedWhite, capturedBlack } = gameState;

  const statusText = useMemo(() => {
    if (status === 'checkmate') return `Checkmate! ${winner === 'white' ? '⬜ White' : '⬛ Black'} wins!`;
    if (status === 'stalemate') return 'Stalemate! It\'s a draw.';
    if (status === 'check') return `${currentTurn === 'white' ? '⬜ White' : '⬛ Black'} is in check!`;
    return `${currentTurn === 'white' ? '⬜ White' : '⬛ Black'}'s turn`;
  }, [status, winner, currentTurn]);

  const statusColor = useMemo(() => {
    if (status === 'checkmate') return 'text-amber-400';
    if (status === 'stalemate') return 'text-blue-400';
    if (status === 'check') return 'text-red-400';
    return currentTurn === 'white' ? 'text-white' : 'text-gray-300';
  }, [status, currentTurn]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Crown className="w-7 h-7 text-amber-400" />
              Chess
            </h1>
            <p className="text-white/60 text-sm">Two-player local chess game</p>
          </div>
          <Button
            onClick={handleNewGame}
            className="bg-amber-600 hover:bg-amber-500 text-white gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Board */}
          <div className="flex flex-col items-center">
            {/* Status bar */}
            <div className={`mb-4 px-5 py-2.5 rounded-full border text-sm font-semibold flex items-center gap-2 ${
              status === 'checkmate' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
              status === 'stalemate' ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' :
              status === 'check' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
              'bg-white/10 border-white/20 text-white'
            }`}>
              {status === 'check' && <AlertTriangle className="w-4 h-4" />}
              {status === 'checkmate' && <Crown className="w-4 h-4" />}
              <span className={statusColor}>{statusText}</span>
            </div>

            {/* Captured pieces - Black's captures (white pieces) */}
            <div className="mb-2 h-7 flex items-center gap-0.5 self-start">
              {capturedWhite.map((p, i) => (
                <span key={i} className="text-lg leading-none opacity-70">{PIECE_SYMBOLS.white[p.type]}</span>
              ))}
            </div>

            {/* Chess board */}
            <div className="border-2 border-amber-800/60 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
              {board.map((row, rowIdx) => (
                <div key={rowIdx} className="flex">
                  {/* Row label */}
                  <div className="w-6 flex items-center justify-center text-xs text-amber-700/80 font-mono bg-amber-950/40 select-none">
                    {8 - rowIdx}
                  </div>
                  {row.map((piece, colIdx) => {
                    const isLight = (rowIdx + colIdx) % 2 === 0;
                    const isSelected = selectedSquare?.[0] === rowIdx && selectedSquare?.[1] === colIdx;
                    const isValidMove = validMoves.some(([r, c]) => r === rowIdx && c === colIdx);
                    const isCapture = isValidMove && !!piece;
                    const kingPos = findKing(board, currentTurn);
                    const isKingInCheck = status === 'check' && kingPos?.[0] === rowIdx && kingPos?.[1] === colIdx;

                    let squareBg = isLight ? 'bg-amber-100' : 'bg-amber-800';
                    if (isSelected) squareBg = 'bg-yellow-400';
                    if (isKingInCheck) squareBg = 'bg-red-500';

                    return (
                      <div
                        key={colIdx}
                        className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer select-none transition-colors duration-100 ${squareBg} ${
                          isSelected ? '' : isLight ? 'hover:bg-amber-200' : 'hover:bg-amber-700'
                        }`}
                        onClick={() => handleSquareClick(rowIdx, colIdx)}
                      >
                        {/* Valid move indicator */}
                        {isValidMove && !isCapture && (
                          <div className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-black/25 pointer-events-none z-10" />
                        )}
                        {/* Capture indicator */}
                        {isCapture && (
                          <div className="absolute inset-0 rounded-sm border-4 border-black/30 pointer-events-none z-10" />
                        )}
                        {/* Piece */}
                        {piece && (
                          <span
                            className={`text-2xl sm:text-3xl leading-none z-20 relative select-none ${
                              piece.color === 'white'
                                ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                                : 'drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]'
                            }`}
                            style={{ textShadow: piece.color === 'white' ? '0 1px 3px rgba(0,0,0,0.9)' : '0 1px 3px rgba(0,0,0,0.5)' }}
                          >
                            {PIECE_SYMBOLS[piece.color][piece.type]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Column labels */}
              <div className="flex bg-amber-950/40">
                <div className="w-6" />
                {['a','b','c','d','e','f','g','h'].map(l => (
                  <div key={l} className="w-10 sm:w-12 text-center text-xs text-amber-700/80 font-mono py-1 select-none">{l}</div>
                ))}
              </div>
            </div>

            {/* Captured pieces - White's captures (black pieces) */}
            <div className="mt-2 h-7 flex items-center gap-0.5 self-start">
              {capturedBlack.map((p, i) => (
                <span key={i} className="text-lg leading-none opacity-70">{PIECE_SYMBOLS.black[p.type]}</span>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4 min-w-[200px]">
            {/* Turn indicator */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Current Turn</h3>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg ${
                  currentTurn === 'white'
                    ? 'bg-white border-amber-400 shadow-lg shadow-amber-400/30'
                    : 'bg-gray-900 border-gray-400'
                }`}>
                  {currentTurn === 'white' ? '♔' : '♚'}
                </div>
                <span className="text-white font-semibold capitalize">{currentTurn}</span>
              </div>
            </div>

            {/* How to play */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">How to Play</h3>
              <ul className="space-y-2 text-white/70 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">1.</span>
                  Click a piece to select it
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">2.</span>
                  Green dots show valid moves
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">3.</span>
                  Click a highlighted square to move
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">4.</span>
                  Protect your King from check!
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Features</h3>
              <ul className="space-y-1.5 text-white/60 text-xs">
                {['Castling', 'En Passant', 'Pawn Promotion', 'Check Detection', 'Checkmate / Stalemate'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {(status === 'checkmate' || status === 'stalemate') && (
              <Button
                onClick={handleNewGame}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white gap-2 animate-pulse"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
