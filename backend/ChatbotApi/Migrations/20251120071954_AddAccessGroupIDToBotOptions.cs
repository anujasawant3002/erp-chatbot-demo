using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatbotApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAccessGroupIDToBotOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccessGroupID",
                table: "BotSubOptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AccessGroupID",
                table: "BotMainOptions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessGroupID",
                table: "BotSubOptions");

            migrationBuilder.DropColumn(
                name: "AccessGroupID",
                table: "BotMainOptions");
        }
    }
}
