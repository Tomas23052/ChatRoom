using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;
using SignalRTeste.Hubs; // Certifique-se de incluir o namespace correto
using SignalRTeste.Models;
using SignalRTeste.Pages;

var builder = WebApplication.CreateBuilder(args);

// Configura��es
builder.Configuration.AddJsonFile("appsettings.json");
var configuration = builder.Configuration;

// Configura��o do MongoDB
MongoDbContext.ConnectionString = configuration.GetSection("MongoConnection:ConnectionString").Value;
MongoDbContext.DatabaseName = configuration.GetSection("MongoConnection:Database").Value;
MongoDbContext.IsSSL = Convert.ToBoolean(configuration.GetSection("MongoConnection:IsSSL").Value);

// Servi�os
builder.Services.AddSingleton<IMongoClient>(new MongoClient(configuration.GetSection("MongoConnection:ConnectionString").Value));
builder.Services.AddSingleton<MongoDbContext>(); // Adicione o servi�o para o MongoDbContext
builder.Services.AddRazorPages();
builder.Services.AddSignalR();

// Rotas de endpoint
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Configurar o pipeline de solicita��o HTTP.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();
app.MapHub<ChatHub>("/chatHub"); // Certifique-se de que ChatHub est� no namespace correto

app.Run();
