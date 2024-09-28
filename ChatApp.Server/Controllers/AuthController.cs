
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Server.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Index()
        {
            return Ok();
        }
    }
}
