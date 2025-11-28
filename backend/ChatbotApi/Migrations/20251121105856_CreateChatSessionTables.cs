using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatbotApi.Migrations
{
    /// <inheritdoc />
    public partial class CreateChatSessionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create CandidateChatHistories table
            migrationBuilder.CreateTable(
                name: "CandidateChatHistories",
                columns: table => new
                {
                    CandidateChatHistoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateUserID = table.Column<int>(type: "int", nullable: false),
                    SessionStart = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SessionEnd = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateChatHistories", x => x.CandidateChatHistoryID);
                    table.ForeignKey(
                        name: "FK_CandidateChatHistories_Users_CandidateUserID",
                        column: x => x.CandidateUserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create ChatMessages table
            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    ChatMessageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    CandidateChatHistoryID = table.Column<int>(type: "int", nullable: true),
                    SenderName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MessageType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentPage = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.ChatMessageID);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChatMessages_CandidateChatHistories_CandidateChatHistoryID",
                        column: x => x.CandidateChatHistoryID,
                        principalTable: "CandidateChatHistories",
                        principalColumn: "CandidateChatHistoryID",
                        onDelete: ReferentialAction.Cascade);
                });

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_CandidateChatHistories_CandidateUserID",
                table: "CandidateChatHistories",
                column: "CandidateUserID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_UserID",
                table: "ChatMessages",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_CandidateChatHistoryID",
                table: "ChatMessages",
                column: "CandidateChatHistoryID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ChatMessages");
            migrationBuilder.DropTable(name: "CandidateChatHistories");
        }
    }
}
