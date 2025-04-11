using Entitiy_Layer.CartModel;
using Entitiy_Layer.PropertyModel;
using Entitiy_Layer.StatusModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data_Access_Layer.Interfaces
{
    public interface ICustomerRepository
    {
        Task<List<Properties>> GetAllPropertiesAsync();
        Task<bool> AddRequestAsync(PropStatus propStatus);
        Task<bool> RemoveRequestAsync(string userId, int propertyId);
        //Task<List<PropStatus>> ViewMyRequestsAsync(string userId);
        Task<List<Cart>> ViewWishlistAsync(string userId);

        //whishlist
        Task AddCartItemAsync(Cart cartItem);

        //Remove to cart
        Task<Cart> GetCartItemAsync(string userId, int propertyId); // Reuse this for lookup
        Task RemoveCartItemAsync(Cart cartItem);

        //View wishlist
        Task<List<Cart>> GetCartItemsByUserIdAsync(string userId);

        Task<List<Cart>> GetSoldOutCartItemsAsync(string userId);
        Task<List<Cart>> GetAvailableCartItemsAsync(string userId);


        //clear wishlist
        Task RemoveCartItemsAsync(IEnumerable<Cart> cartItems);

        //Status
        Task<PropStatus> GetStatusByUserIdAndPropertyIdAsync(string userId, int propertyId);

        //view my request
        Task<List<PropStatus>> GetPropStatusWithDetailsByUserIdAsync(string userId);


    }
}
