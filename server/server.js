
'use strict';
var vscode_languageserver = require('vscode-languageserver');
var connection = vscode_languageserver.createConnection(new vscode_languageserver.IPCMessageReader(process), new vscode_languageserver.IPCMessageWriter(process));
var documents = new vscode_languageserver.TextDocuments();
documents.listen(connection);

var workspaceRoot;
connection.onInitialize(function (params) {
    workspaceRoot = params.rootPath;
    return {
        capabilities: {            
            textDocumentSync: documents.syncKind
        }
    };
});


documents.onDidChangeContent(function (change) {
    console.log(change);
});

connection.listen();
