﻿using System.ComponentModel.DataAnnotations;

namespace ChatApp.Server.Domain.DTO
{
    public class UserDTO
    {

        [Required]
        [StringLength(20)]
        public string Username { get; set; } = null!;

        public bool IsOnline { get; set; } = false;
    }
}
