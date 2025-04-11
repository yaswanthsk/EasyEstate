using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data_Access_Layer.Migrations
{
    /// <inheritdoc />
    public partial class SessionModalValidation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "OwnerID",
                table: "Properties",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserID",
                table: "CustomerCart",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "ActiveSession",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(36)",
                oldMaxLength: 36);

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "ActiveSession",
                type: "nvarchar(2500)",
                maxLength: 2500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.CreateIndex(
                name: "IX_Properties_OwnerID",
                table: "Properties",
                column: "OwnerID");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerCart_UserID",
                table: "CustomerCart",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ActiveSession_UserId",
                table: "ActiveSession",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ActiveSession_AspNetUsers_UserId",
                table: "ActiveSession",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerCart_AspNetUsers_UserID",
                table: "CustomerCart",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Properties_AspNetUsers_OwnerID",
                table: "Properties",
                column: "OwnerID",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActiveSession_AspNetUsers_UserId",
                table: "ActiveSession");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerCart_AspNetUsers_UserID",
                table: "CustomerCart");

            migrationBuilder.DropForeignKey(
                name: "FK_Properties_AspNetUsers_OwnerID",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_OwnerID",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_CustomerCart_UserID",
                table: "CustomerCart");

            migrationBuilder.DropIndex(
                name: "IX_ActiveSession_UserId",
                table: "ActiveSession");

            migrationBuilder.AlterColumn<string>(
                name: "OwnerID",
                table: "Properties",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserID",
                table: "CustomerCart",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "ActiveSession",
                type: "nvarchar(36)",
                maxLength: 36,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "ActiveSession",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(2500)",
                oldMaxLength: 2500);
        }
    }
}
