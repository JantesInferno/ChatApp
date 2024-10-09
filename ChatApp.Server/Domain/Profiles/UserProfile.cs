using AutoMapper;
using ChatApp.Server.Domain.DTO;
using ChatApp.Server.Domain.Identity;

namespace ChatApp.Server.Domain.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, SignInRequest>().ReverseMap();
            CreateMap<User, SignInResponse>().ReverseMap();
            CreateMap<User, UserDTO>().ReverseMap();
        }
    }
}
