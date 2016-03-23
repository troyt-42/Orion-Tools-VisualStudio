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
    
    var bugsHover = [];
    var firstTime = true;
    var statusBarE = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    var statusBarW = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    context.subscriptions.push(statusBarE);
    context.subscriptions.push(statusBarW);

    client.onNotification({method:"testNotification"}, function(output){
        var status = output.pop();
        var tempE = status.errorNum <= 1 ? "JSError: " : "JSErrors: "; 
        var tempW = status.warningNum <= 1 ? "JSWarning: " : "JSWarnings: ";
        var tempIconE = status.errorNum === 0 ? "$(check) " : "$(x) ";
        var tempIconW = status.warningNum === 0 ? "$(check) " : "$(alert) ";
        statusBarE.text = tempIconE + tempE + status.errorNum;
        statusBarW.text = tempIconW + tempW + status.warningNum;
        
        bugsHover = [];
        for(var i = 0; i < output.length; i++){
            var problem = output[i];
            var tempStart = new vscode.Position(problem.range.start.line, problem.range.start.character);
            var tempEnd = new vscode.Position(problem.range.end.line, problem.range.end.character);
            bugsHover.push({start: tempStart, end:tempEnd, hover: new vscode.Hover(problem.message)});
        };
        if (firstTime){  
            statusBarE.color = "#faebd7";
            statusBarW.color = "#faebd7";
            statusBarE.show();
            statusBarW.show();statusBarE.color = "#faebd7";
            statusBarE.color = "#faebd7";
            statusBarE.show();
            statusBarW.show();
            var disposable = vscode.languages.registerHoverProvider("javascript", {
                provideHover: function (document, position, token) {
                    for (var index = 0; index < bugsHover.length; index++) {
                        var hover = bugsHover[index];
                        if (position.isAfterOrEqual(hover.start) && position.isBeforeOrEqual(hover.end)){
                            return hover.hover;
                        }
                    }
                    return null;
                }
            }); 
            context.subscriptions.push(disposable);
            firstTime = false;
        }
    });
    

}
exports.activate = activate;
//# sourceMappingURL=extension.js.map