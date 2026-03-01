import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  // Old attendance record type (without present and leaving time)
  type OldAttendanceRecord = {
    id : Nat;
    name : Text;
    timestamp : Time.Time;
    status : AttendanceStatus;
  };

  type AttendanceStatus = {
    #present;
    #late;
    #absent;
  };

  // Old actor type, principal-based PersonId keys
  type OldActor = {
    attendanceRecords : Map.Map<Principal, [OldAttendanceRecord]>;
  };

  // New attendance record type (with present and leaving time)
  type NewAttendanceRecord = {
    id : Nat;
    name : Text;
    presentTime : ?Time.Time;
    leavingTime : ?Time.Time;
    status : AttendanceStatus;
  };

  // New actor type, principal-based PersonId keys
  type NewActor = {
    attendanceRecords : Map.Map<Principal, [NewAttendanceRecord]>;
  };

  public func run(old : OldActor) : NewActor {
    let newAttendanceRecords = old.attendanceRecords.map<Principal, [OldAttendanceRecord], [NewAttendanceRecord]>(
      func(_personId, oldRecordArray) {
        oldRecordArray.map(
          func(oldRecord) {
            {
              oldRecord with
              presentTime = ?oldRecord.timestamp;
              leavingTime = null;
            };
          }
        );
      }
    );
    { attendanceRecords = newAttendanceRecords };
  };
};
