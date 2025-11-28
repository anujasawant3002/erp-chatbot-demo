using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatbotApi.Migrations
{
    /// <inheritdoc />
    public partial class AddChatbotTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateTable(
                name: "BotMainOptions",
                columns: table => new
                {
                    BotMainOptionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BotMainOptions", x => x.BotMainOptionID);
                });

            migrationBuilder.CreateTable(
                name: "CandidateChatHistories",
                columns: table => new
                {
                    CandidateChatHistoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateUserID = table.Column<int>(type: "int", nullable: false),
                    ChatMessageID = table.Column<int>(type: "int", nullable: false),
                    ChatDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateChatHistories", x => x.CandidateChatHistoryID);
                    table.ForeignKey(
                        name: "FK_CandidateChatHistories_ChatMessages_ChatMessageID",
                        column: x => x.ChatMessageID,
                        principalTable: "ChatMessages",
                        principalColumn: "ChatMessageID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CandidateChatHistories_Users_CandidateUserID",
                        column: x => x.CandidateUserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BotSubOptions",
                columns: table => new
                {
                    BotSubOptionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BotMainOptionID = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BotSubOptions", x => x.BotSubOptionID);
                    table.ForeignKey(
                        name: "FK_BotSubOptions_BotMainOptions_BotMainOptionID",
                        column: x => x.BotMainOptionID,
                        principalTable: "BotMainOptions",
                        principalColumn: "BotMainOptionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_BotSubOptions_BotMainOptionID",
                table: "BotSubOptions",
                column: "BotMainOptionID");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateChatHistories_CandidateUserID",
                table: "CandidateChatHistories",
                column: "CandidateUserID");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateChatHistories_ChatMessageID",
                table: "CandidateChatHistories",
                column: "ChatMessageID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BotSubOptions");

            migrationBuilder.DropTable(
                name: "CandidateChatHistories");

            migrationBuilder.DropTable(
                name: "BotMainOptions");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }
    }
}
