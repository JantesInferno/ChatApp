using System.Security.Cryptography;
using System.Text;

namespace ChatApp.Server.Core.Utils
{
    public class EncryptionUtil
    {
        private static readonly string _key;

        static EncryptionUtil()
        {
            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            _key = configBuilder["Encryption:Key"] ?? throw new InvalidOperationException("Encryption key is missing in the configuration.");
        }

        public static string Encrypt(string plainText)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(_key);
                aesAlg.GenerateIV(); // Create new IV

                var encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);
                using (var msEncrypt = new MemoryStream())
                {
                    msEncrypt.Write(aesAlg.IV, 0, aesAlg.IV.Length); // Prepend IV to the encrypted data
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (var swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(plainText);
                    }

                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }

        public static string Decrypt(string cipherText)
        {
            var fullCipher = Convert.FromBase64String(cipherText);

            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(_key);
                aesAlg.IV = fullCipher.Take(aesAlg.BlockSize / 8).ToArray(); // Extract IV from the encrypted data

                var decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
                using (var msDecrypt = new MemoryStream(fullCipher.Skip(aesAlg.BlockSize / 8).ToArray()))
                using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                using (var srDecrypt = new StreamReader(csDecrypt))
                {
                    return srDecrypt.ReadToEnd();
                }
            }
        }

        public static bool IsBase64String(string base64)
        {
            // Kontrollera att strängen är delbar med 4 och endast innehåller giltiga Base64-tecken
            Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
            return base64.Length % 4 == 0 && Convert.TryFromBase64String(base64, buffer, out _);
        }
    }
}
