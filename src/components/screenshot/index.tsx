import { Note } from '@/services/note';
import { VueComponent } from '@/shims-vue';
import { VNode } from 'vue';
import { Component, Prop, Ref } from 'vue-property-decorator';
import './index.scss';
import { screenshot, screenshotCopy } from '@/utils/image';
import Loading from '../common/loading';
import Dialog from '../common/dialog';
import { downloadFile } from '@/utils/file';
import { copyText } from '@/utils';
import Toast from '../common/toast';
import Editor from '../common/editor';

interface IScreenshotProps {
  width?: string;
  height?: string;
  menu?: string[];
}

@Component({
  name: 'Screenshot',
})
export class Screenshot extends VueComponent<IScreenshotProps> {
  /**
   * 菜单
   */
  @Prop({ default: () => ['md', 'image', 'copyText', 'copyImage'] })
  private readonly menu!: string[];

  /**
   * 长宽
   */
  @Prop({ default: '65%' }) private readonly width!: string;
  @Prop({ default: '80%' }) private readonly height!: string;

  /**
   * 编辑器
   */
  @Ref() private readonly refScreenshotPreview!: Editor;

  /**
   * 弹窗
   */
  @Ref() private readonly refDialog!: Dialog;
  /**
   * 当前笔记
   */
  private note: Note | null = null;

  /**
   * 加载
   */
  private loading = false;

  /**
   * 显示
   * @param note
   */
  public show(note: Note): void {
    this.note = note;
    this.refDialog.show();
  }

  /**
   * 下载
   */
  private handleClickScreenshot(): Promise<any> {
    this.loading = true;
    // 生成截图
    return screenshot(this.refScreenshotPreview.editorContent, this.note?.title).then(() => {
      this.loading = false;
    });
  }

  /**
   * 复制图片
   * @returns
   */
  private handleClickCopyImage() {
    this.loading = true;
    // 生成截图
    return screenshotCopy(this.refScreenshotPreview.editorContent).then(() => {
      this.loading = false;
    });
  }

  /**
   * markdown下载
   */
  private handleClickDownloadMarkdown() {
    downloadFile(this.note?.text || '', `${this.note?.title || 'XYNote'}.md`);
  }

  /**
   * 复制文本
   */
  private handleClickCopyText() {
    copyText(this.note?.text || '');
    Toast('复制成功');
  }

  public render(): VNode {
    return (
      <Dialog width={this.width} height={this.height} ref="refDialog" class="screenshot-dialog">
        <div class="screenshot-content">
          <div class="screenshot-content-top">
            <span>{this.note?.title}</span>
          </div>
          <div class="screenshot-content-preview">
            <Editor ref="refScreenshotPreview" value={this.note?.text || ''} type="preview" />
          </div>
          <div class="screenshot-content-bottom">
            {this.menu.includes('md') && (
              <span class="button" onclick={this.handleClickDownloadMarkdown}>
                Markdown
              </span>
            )}
            {this.menu.includes('copyText') && (
              <span
                class="button"
                vDebounce={() => {
                  this.handleClickCopyText();
                }}
              >
                复制文本
              </span>
            )}
            {this.menu.includes('image') && (
              <span class="button" onclick={this.handleClickScreenshot}>
                下载图片
              </span>
            )}
            {this.menu.includes('copyImage') && (
              <span class="button" onclick={this.handleClickCopyImage}>
                复制图片
              </span>
            )}
          </div>
          {this.loading && (
            <div class="screenshot-content-loading">
              <Loading text="加载中" />
            </div>
          )}
        </div>
      </Dialog>
    );
  }
}

let screenshotInstance: Screenshot | null = null;
export default function showScreenshotDialog(note: Note, propsData: IScreenshotProps = {}): Screenshot {
  if (!screenshotInstance) {
    const panel = document.querySelector('#Screenshot');
    if (panel) {
      document.removeChild(panel);
    }
    const el = document.createElement('div');
    el.id = 'Screenshot';
    document.body.appendChild(el);
    screenshotInstance = new Screenshot({ propsData }).$mount(el);
  }
  screenshotInstance.show(note);
  return screenshotInstance;
}
