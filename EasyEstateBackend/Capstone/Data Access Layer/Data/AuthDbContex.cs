using Entitiy_Layer.AccountModel;
using Entitiy_Layer.ReviewModel;
using Entitiy_Layer.PropertyModel;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Entitiy_Layer.CartModel;
using Entitiy_Layer.ChatModel;
using Entitiy_Layer.StatusModel;
using Entitiy_Layer.PaymentModel;

namespace Data_Access_Layer.Data
{
    public class AuthDbContext : IdentityDbContext<ApplicationUser>
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {


        }
        public DbSet<Properties> Property { get; set; }

        public DbSet<Cart> CustomerCart { get; set; }

        public DbSet<PropStatus> Status { get; set; }

        public DbSet<ChatMessage> ChatSystem { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Properties> Properties { get; set; }
        public DbSet<TemporaryPayment> TemporaryPayments { get; set; }
        public DbSet<PermanentPayment> PermanentPayments { get; set; }

        public DbSet<ActiveSession> ActiveSessions { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            //SeedRoles(builder);
            builder.Entity<ChatMessage>()
                .HasKey(c => c.Id); // Set Id as th2e primary key

            builder.Entity<ChatMessage>()
                .HasOne(m => m.Sender)
                .WithMany() // One sender can send many messages
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ChatMessage>()
                .HasOne(m => m.Receiver)
                .WithMany() // One receiver can receive many messages
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);


        }
        private static void SeedRoles(ModelBuilder builder)
        {
            builder.Entity<IdentityRole>().HasData
                (
                new IdentityRole() { Name = "Owner", ConcurrencyStamp = "1", NormalizedName = "Owner" },
                  new IdentityRole() { Name = "Customer", ConcurrencyStamp = "2", NormalizedName = "Customer" });
        }


    }
}
