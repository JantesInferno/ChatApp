using AutoMapper;
using ChatApp.Server.Domain.DTO;
using ChatApp.Server.Domain.Entities;
using ChatApp.Server.Domain.Identity;

namespace ChatApp.Server.Domain.Profiles
{
    public class ChatRoomProfile : Profile
    {
        public ChatRoomProfile()
        {
            CreateMap<ChatRoom, ChatRoomDTO>().ReverseMap();
        }
    }
}
