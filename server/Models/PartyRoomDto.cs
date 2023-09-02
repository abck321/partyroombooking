using System;

namespace server.Models
{
    public class PartyRoomDto
    {
        public required string PartyRoomId { get; set; }
        public required string Name { get; set; }
        public required string Location { get; set; }
        public required string Description { get; set; }
    }
}
