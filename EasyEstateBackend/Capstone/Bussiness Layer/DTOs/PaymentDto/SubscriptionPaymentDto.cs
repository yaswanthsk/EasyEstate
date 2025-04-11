using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.DTOs.PaymentDto
{
    public class SubscriptionPaymentDto
    {
        public decimal Amount { get; set; }
        public string Plan { get; set; }
        public string PaidAt { get; set; } 
    }
}
