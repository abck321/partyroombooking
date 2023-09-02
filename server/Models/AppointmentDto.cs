using System;

namespace server.Models
{
    public class AppointmentDto
    {
        public required string PartyRoomId { get; set; }
        public required string PartyRoomName { get; set; }
        public required List<Timeslot> Timeslots { get; set; }
    }

    public class Timeslot
    {
        public required string AppointmentId { get; set; }
        public required string Date { get; set; }
        public required string StartTime { get; set; }
        public required string EndTime { get; set; }
        public required bool Confirm { get; set; }
    }
}
