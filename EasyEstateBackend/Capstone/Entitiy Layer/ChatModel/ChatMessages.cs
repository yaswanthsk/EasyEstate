using Entitiy_Layer.AccountModel;

namespace Entitiy_Layer.ChatModel
{
    public class ChatMessage
    {
        public int Id { get; set; } // Primary Key
        public string SenderId { get; set; } // Foreign key to the AspNetUsers table
        public string ReceiverId { get; set; } // Foreign key to the AspNetUsers table
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        public virtual ApplicationUser Sender { get; set; } // Navigation property for Sender
        public virtual ApplicationUser Receiver { get; set; } // Navigation property for Receiver
    }
}
