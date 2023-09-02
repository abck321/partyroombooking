using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class ResourceController : ControllerBase
{
    [HttpGet]
    [Authorize]
    public IActionResult GetProtectedResource()
    {
        return Ok("Protected resource accessed successfully");
    }
}