const STORAGE_KEY = "memo_notes";

Page({
  data: { notes: [], keyword: "", filteredNotes: [] },

  onShow() { this.loadNotes(); },

  loadNotes() {
    const notes = wx.getStorageSync(STORAGE_KEY) || [];
    this.setData({ notes }, () => this.filterNotes());
  },

  filterNotes() {
    const keyword = this.data.keyword.trim().toLowerCase();
    const filteredNotes = keyword
      ? this.data.notes.filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(keyword))
      : this.data.notes;
    this.setData({ filteredNotes });
  },

  onSearchInput(e) { this.setData({ keyword: e.detail.value }, () => this.filterNotes()); },
  clearSearch() { this.setData({ keyword: "" }, () => this.filterNotes()); },
  createNote() { wx.navigateTo({ url: "/pages/edit/edit" }); },
  editNote(e) { wx.navigateTo({ url: `/pages/edit/edit?id=${e.currentTarget.dataset.id}` }); },

  deleteNote(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "删除备忘录", content: "删除后无法恢复，确定继续吗？", confirmColor: "#e5484d",
      success: (res) => {
        if (!res.confirm) return;
        const notes = this.data.notes.filter((note) => note.id !== id);
        wx.setStorageSync(STORAGE_KEY, notes);
        this.setData({ notes }, () => this.filterNotes());
        wx.showToast({ title: "已删除", icon: "success" });
      },
    });
  },
});
