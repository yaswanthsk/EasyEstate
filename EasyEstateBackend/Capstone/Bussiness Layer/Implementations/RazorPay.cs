using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Razorpay.Api;

namespace Bussiness_Layer.Implementations
{
    public class RazorpayConfig
    {
        public string ApiKey { get; set; }
        public string ApiSecret { get; set; }
    }

    public class RazorPay
    {
        private readonly string _apiKey;
        private readonly string _apiSecret;

        public RazorPay(IOptions<RazorpayConfig> config)
        {
            _apiKey = config.Value.ApiKey;
            _apiSecret = config.Value.ApiSecret;
        }

        public Order CreateOrder(decimal amount, string currency, string receipt)
        {
            var razorpayClient = new RazorpayClient(_apiKey, _apiSecret);
            var options = new Dictionary<string, object>
        {
            { "amount", (amount * 100).ToString() }, // Amount in paise
            { "currency", currency },
            { "receipt", receipt },
            { "payment_capture", 1 }
        };

            return razorpayClient.Order.Create(options);
        }
    }
}
