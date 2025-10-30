import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand('isrpo.cleanSpaces', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('Нет активного редактора');
      return;
    }

    const doc = editor.document;

    const ranges: vscode.Range[] = [];
    if (editor.selections && editor.selections.some(s => !s.isEmpty)) {
      for (const sel of editor.selections) {
        const startLine = sel.start.line;
        const endLine = sel.end.line;
        ranges.push(new vscode.Range(startLine, 0, endLine, doc.lineAt(endLine).range.end.character));
      }
    } else {
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

export function deactivate() {}
