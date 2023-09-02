using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using server.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public UserController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] dynamic registrationData)
    {
        try
        {
            string username = registrationData.GetProperty("username").GetString();
            string email = registrationData.GetProperty("email").GetString();
            string password = registrationData.GetProperty("password").GetString();

            var connectionString = _configuration.GetConnectionString("MySqlConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string checkEmailQuery = "SELECT COUNT(*) FROM users WHERE email = @Email";

                using (var checkEmailCommand = new MySqlCommand(checkEmailQuery, connection))
                {
                    checkEmailCommand.Parameters.AddWithValue("@Email", email);
                    int emailCount = Convert.ToInt32(await checkEmailCommand.ExecuteScalarAsync());
                    if (emailCount > 0)
                    {
                        return BadRequest("Email already exists.");
                    }
                }

                string insertQuery = "INSERT INTO users (id, username, email, password) VALUES (@id, @Username, @Email, @Password)";

                using (var command = new MySqlCommand(insertQuery, connection))
                {
                    command.Parameters.AddWithValue("@Id", Guid.NewGuid().ToString());
                    command.Parameters.AddWithValue("@Username", username);
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", PasswordEncoder.EncodePassword(password));

                    await command.ExecuteNonQueryAsync();
                }

                connection.Close();
            }

            return Ok("Account created.");

        }
        catch (Exception)
        {
            return BadRequest("An error occurred during account creation.");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] dynamic loginData)
    {
        string email = loginData.GetProperty("email").GetString();
        string password = loginData.GetProperty("password").GetString();

        User user = await GetUserByEmailAndPassword(email, PasswordEncoder.EncodePassword(password));
        if (user == null) return Unauthorized("Invalid username/email or password.");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: "your_issuer",
            audience: "your_audience",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your_secret_key_12314dasfatfewfsafdsaf")),
                SecurityAlgorithms.HmacSha256)
        );

        return Ok(new
        {
            access_token = new JwtSecurityTokenHandler().WriteToken(token),
            expires_in = token.ValidTo,
        });
    }
    private async Task<User?> GetUserByEmailAndPassword(string email, string encodedPassword)
    {
        string query = "SELECT * FROM users WHERE email = @Email AND password = @Password LIMIT 1";

        var connectionString = _configuration.GetConnectionString("MySqlConnection");

        using (var connection = new MySqlConnection(connectionString))
        {
            await connection.OpenAsync();

            using (var command = new MySqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Email", email);
                command.Parameters.AddWithValue("@Password", encodedPassword);

                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        var user = new User
                        {
                            UserId = reader["id"].ToString(),
                            Username = reader["username"].ToString(),
                            Email = reader["email"].ToString(),
                        };

                        return user;
                    }
                }
            }
        }

        return null;
    }
}