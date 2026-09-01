const STORAGE_KEY = "memo_notes";

Page({
  data: { id: "", title: "", content: "", isEditing: false },
  onLoad(options) {
    if (!options.id) return;
    const note = (wx.getStorageSync(STORAGE_KEY) || []).find((item) => item.id === options.id);
    if (note) this.setData({ ...note, isEditing: true });
  },
  onTitleInput(e) { this.setData({ title: e.detail.value }); },
  onContentInput(e) { this.setData({ content: e.detail.value }); },
  saveNote() {
    const title = this.data.title.trim();
    const content = this.data.content.trim();
    if (!title && !content) { wx.showToast({ title: "请先填写内容", icon: "none" }); return; }
    const notes = wx.getStorageSync(STORAGE_KEY) || [];
    const now = Date.now();
    const note = { id: this.data.id || `${now}-${Math.random().toString(36).slice(2, 8)}`, title, content, updatedAt: now, updatedAtText: this.formatTime(now) };
    const nextNotes = this.data.id ? notes.map((item) => item.id === this.data.id ? note : item) : [note, ...notes];
    wx.setStorageSync(STORAGE_KEY, nextNotes);
    wx.showToast({ title: "保存成功", icon: "success" });
    setTimeout(() => wx.navigateBack(), 500);
  },
  formatTime(timestamp) {
    const date = new Date(timestamp); const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  },
});
