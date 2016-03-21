'use strict';
var path = require('path');
var vscode = require('vscode');
var vscode_languageclient = require('vscode-languageclient');
function activate(context) {
    console.log("Activated");
    var serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
    var debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
    var serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient.TransportKind.ipc, options: debugOptions }
    };
    // Options to control the language client
    var clientOptions = {
        // Register the server for plain text documents
        documentSelector: ['javascript'],
        synchronize: {
            // Synchronize the setting section 'languageServerExample' to the server
            configurationSection: 'orionToolsServer',
            // Notify the server about file changes to '.clientrc files contain in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    // Create the language client and start the client.
    var client = new vscode_languageclient.LanguageClient('orion-tools-server', serverOptions, clientOptions);
    var disposable = client.start();
    // Push the disposable to the context's subscriptions so that the 
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
    
    client.onNotification({method:"testNotification"}, function(output){
        console.log(output);
        
        vscode.languages.registerHoverProvider("javascript", {
            provideHover: function (document, position, token) {
                for(var i = 0; i < output.length; i++){
                    var problem = output[i];
                    var tempStart = new vscode.Position(problem.range.start.line, problem.range.start.character);
                    var tempEnd = new vscode.Position(problem.range.end.line, problem.range.end.character);
                    if (position.isAfterOrEqual(tempStart) && position.isBeforeOrEqual(tempEnd)){
                        return new vscode.Hover("Quick Fix?");
                    }
                };
                return null;
            }
        }); 
        // output.forEach(function (problem) {
            
        // });
    });
    

}
exports.activate = activate;
//# sourceMappingURL=extension.js.map