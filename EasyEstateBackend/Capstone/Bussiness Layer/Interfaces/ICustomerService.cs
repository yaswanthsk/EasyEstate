using Bussiness_Layer.DTOs.CartDto;
using Bussiness_Layer.DTOs.PropertyDto;
using Bussiness_Layer.DTOs.StatusDto;
using Entitiy_Layer.CartModel;
using Entitiy_Layer.StatusModel;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.Interfaces
{
    public interface ICustomerService
    {
        Task<List<PropertiesGetDto>> GetAllPropertiesAsync();
        Task SendRequestAsync(PropStatusPostDto propStatusPostDto);
        Task<bool> RemoveRequestAsync(string userId, int propertyId);
        //Task<List<PropStatusDto>> ViewMyRequestsAsync(string userId);


        //Add to cart
        Task<string> AddToCartAsync(CartDto cartDto);

        //remove from cart
        Task<bool> RemoveItemFromCartAsync(string userId, int propertyId);

        //View Wishlist
        Task<List<CartDto>> GetWishlistItemsAsync(string userId);

        Task<List<CartGetDto>> ViewCartWithAvailableAsync(string userId);
        Task<List<CartGetDto>> ViewCartWithSoldAsync(string userId);


        //clear wishlist
        Task<(bool IsSuccess, string Message)> ClearCartAsync(string userId);

        //status
        Task<bool> IsRequestAlreadySentAsync(string userId, int propertyId);

        //View my request
        Task<List<PropStatusDto>> GetUserRequestsAsync(string userId);

    }
}
