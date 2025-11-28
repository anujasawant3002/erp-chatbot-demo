using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatbotApi.Migrations
{
    /// <inheritdoc />
    public partial class AddBotSubOptionAnswerTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BotSubOptionAnswers",
                columns: table => new
                {
                    BotSubOptionAnswerID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BotSubOptionID = table.Column<int>(type: "int", nullable: false),
                    AnswerText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BotSubOptionAnswers", x => x.BotSubOptionAnswerID);
                    table.ForeignKey(
                        name: "FK_BotSubOptionAnswers_BotSubOptions_BotSubOptionID",
                        column: x => x.BotSubOptionID,
                        principalTable: "BotSubOptions",
                        principalColumn: "BotSubOptionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BotSubOptionAnswers_BotSubOptionID",
                table: "BotSubOptionAnswers",
                column: "BotSubOptionID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BotSubOptionAnswers");
        }
    }
}
