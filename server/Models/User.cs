using System;

namespace server.Models
{
    public class User
    {
        public required string UserId { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
    }
}
