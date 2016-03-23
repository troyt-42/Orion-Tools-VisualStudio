'use strict';
var vscode_languageserver = require('vscode-languageserver');
var connection = vscode_languageserver.createConnection(new vscode_languageserver.IPCMessageReader(process), new vscode_languageserver.IPCMessageWriter(process));
var documents = new vscode_languageserver.TextDocuments();
documents.listen(connection);
var script_resolver = require("./scriptResolver.js");
var orion_js_lib = require("./orionJavaScript.js");
var orion_js = new orion_js_lib(new script_resolver(), false);
var path = require("path");

var workspaceRoot;
connection.onInitialize(function (params) {
    workspaceRoot = params.rootPath;
    return {
        capabilities: {            
            //  textDocumentSync: vscode_languageserver.TextDocumentSyncKind.Incremental
            textDocumentSync: documents.syncKind
        }
    };
});


var defaults = {
	"accessor-pairs" : 1,
	"curly" : 1,
	"eqeqeq": 1,
	"missing-doc" : 0, 
	"missing-nls" : 0,
	"new-parens" : 1,
	"no-caller": 1,
	"no-comma-dangle" : 1, 
	"no-cond-assign" : 2,
	"no-console" : 0, 
	"no-constant-condition" : 2,
	"no-control-regex" : 2,
	"no-debugger" : 1,
	"no-dupe-keys" : 2,
	"no-duplicate-case": 2,
	"no-else-return" : 1,
	"no-empty-block" : 1,
	"no-empty-character-class" : 2,
	"no-empty-label" : 2,
	"no-eq-null" : 1,
	"no-eval" : 0,
	"no-extra-boolean-cast" : 2,
	"no-extra-parens" : 1,
	"no-extra-semi": 1,
	"no-fallthrough" : 2, 
	"no-implied-eval" : 0,
	"no-invalid-regexp": 2,
	"no-irregular-whitespace" : 0,
	"no-iterator": 2, 
	"no-jslint" : 1, 
	"no-mixed-spaces-and-tabs" : 0,
	"no-negated-in-lhs" : 2,
	"no-new-array": 1,
	"no-new-func" : 1,
	"no-new-object" : 1,
	"no-new-wrappers" : 1,
	"no-obj-calls" : 2,
	"no-proto" : 2, 
	"no-redeclare" : 1,
	"no-regex-spaces" : 2,
	"no-reserved-keys" : 2,
	"no-self-compare" : 2,
	"no-self-assign" : 2,
	"no-shadow" : 1,
	"no-shadow-global" : 1,
	"no-sparse-arrays" : 1, 
	"no-throw-literal" : 1,
	"no-undef" : 2,
	"no-undef-init" : 1,
	"no-unreachable" : 2, 
	"no-unused-params" : 1,
	"no-unused-vars" : 1,
	"no-use-before-define" : 1,
	"no-with" : 1,
	"radix" : 1,
	"semi" : 2,
	"type-checked-consistent-return" : 0,
	"unnecessary-nls" : 1,
	"use-isnan" : 2,
	"valid-typeof" : 2
};

documents.onDidChangeContent(function (change) {
    console.log(change);
    var text = change.document._content;
    var name = change.document._uri;
    var type = "full";
    
    orion_js.Tern.lint(name, defaults, null, [{type: type, name: name, text: text}], function(result, err){
        // console.log(result, err);
        if (!err){
            var diagnostics = [];
            var dataToClient = [];
            var errorNum = 0;
            var warningNum = 0;
            result.forEach(function(problem){
                var range, startPosition, endPosition = {};
                var iconPath = __dirname + "\\orion.png";
                if (problem.related && problem.related.range){
                    startPosition = change.document.positionAt(problem.related.range[0]);
                    endPosition = change.document.positionAt(problem.related.range[1]);
                } else {
                    startPosition = change.document.positionAt(problem.node.range[0]);
                    endPosition = change.document.positionAt(problem.node.range[1]); 
                }
                range = {
                    start: { line: startPosition.line, character: startPosition.character },
                    end: { line: endPosition.line, character: endPosition.character }
                };
                var severity = problem.severity > 1 ? vscode_languageserver.DiagnosticSeverity.Error :vscode_languageserver.DiagnosticSeverity.Warning;
                if (severity === vscode_languageserver.DiagnosticSeverity.Error){
                    errorNum++;
                } else {
                    warningNum++;
                }
                diagnostics.push({
                    severity:severity,
                    range: range
                });
                dataToClient.push({
                    severity: severity,
                    range: range,
                    // message: "![logo](" + iconPath + ")[`ORION`] " + problem.message
                    message: "[`ORION`] " + problem.message,
                    rawMessage: problem.message
                });
                
            })
            dataToClient.push({
                errorNum: errorNum,
                warningNum: warningNum
            });
        }
        console.log(diagnostics);
        connection.sendDiagnostics({ uri:change.document.uri, diagnostics:diagnostics});
        connection.sendNotification({method: "testNotification"}, dataToClient);

    });
    
});

// connection.onDidChangeTextDocument(function (params) {
//     // A text document got opened in VS Code.
//     // params.uri uniquely identifies the document. For documents store on disk this is a file URI.
//     // params.text the initial full content of the document.
//     console.log(params);
    
// });
connection.listen();
