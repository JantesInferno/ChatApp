using AutoMapper;
using ChatApp.Server.Domain.DTO;
using ChatApp.Server.Domain.Identity;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ChatApp.Server.Domain.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, SignInDTO>().ReverseMap();
            //CreateMap<User, RegisterUserDTO>().ReverseMap();
            CreateMap<User, UserDTO>().ReverseMap();
        }
    }
}
