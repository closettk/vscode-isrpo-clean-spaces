"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    const cmd = vscode.commands.registerCommand('isrpo.cleanSpaces', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Нет активного редактора');
            return;
        }
        const doc = editor.document;
        const ranges = [];
        if (editor.selections && editor.selections.some(s => !s.isEmpty)) {
            for (const sel of editor.selections) {
                const startLine = sel.start.line;
                const endLine = sel.end.line;
                ranges.push(new vscode.Range(startLine, 0, endLine, doc.lineAt(endLine).range.end.character));
            }
        }
        else {
            const last = doc.lineCount - 1;
            ranges.push(new vscode.Range(0, 0, last, doc.lineAt(last).range.end.character));
        }
        const edit = new vscode.WorkspaceEdit();
        let changedLines = 0;
        const collapseInline = /(?<=\S) {2,}(?=\S)/g;
        const trimTrailing = /[ \t]+$/gm;
        for (const r of ranges) {
            const original = doc.getText(r);
            const lines = original.split(/\r?\n/);
            let modified = false;
            for (let i = 0; i < lines.length; i++) {
                const before = lines[i];
                let after = before.replace(collapseInline, ' ');
                after = after.replace(trimTrailing, '');
                if (after !== before) {
                    lines[i] = after;
                    modified = true;
                    changedLines++;
                }
            }
            if (modified) {
                const newText = lines.join(doc.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n');
                edit.replace(doc.uri, r, newText);
            }
        }
        if (changedLines === 0) {
            vscode.window.showInformationMessage('Двойных/хвостовых пробелов не найдено 👍');
            return;
        }
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage(`Готово: обновлено строк — ${changedLines}`);
    });
    context.subscriptions.push(cmd);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map