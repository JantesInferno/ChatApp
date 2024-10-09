using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class addedShortDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ShortDate",
                table: "ChatMessages",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShortDate",
                table: "ChatMessages");
        }
    }
}
