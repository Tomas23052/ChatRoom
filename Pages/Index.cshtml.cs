using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SignalRTeste.Model;
using SignalRTeste.Models;
using System.Security;

namespace SignalRTeste.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly MongoDbContext _dbContext;

        public IndexModel(ILogger<IndexModel> logger, MongoDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        public void OnGet()
        {
           
        }

        public void OnPost(string messageInput, string userInput) {
            var message = new Message { message = messageInput };
            _dbContext.Messages.InsertOne( message );
          
        }
    }
}