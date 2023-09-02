using System;
using System.Security.Cryptography;
using System.Text;

public static class PasswordEncoder
{
    public static string EncodePassword(string password)
    {
        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            byte[] hashBytes = sha256.ComputeHash(passwordBytes);
            string encodedPassword = BitConverter.ToString(hashBytes).Replace("-", string.Empty);
            return encodedPassword;
        }
    }
}