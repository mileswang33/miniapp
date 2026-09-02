const STORAGE_KEY = "memo_notes";
const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

Page({
  data: {
    year: 0,
    month: 0,
    monthTitle: "",
    weekDays: WEEK_DAYS,
    calendarDays: [],
    selectedDate: "",
    selectedDateText: "",
    agendaCountText: "",
    selectedNotes: [],
    notesByDate: {},
    todayKey: "",
  },

  onLoad() {
    const today = new Date();
    this.setData({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      selectedDate: this.formatDateKey(today),
      todayKey: this.formatDateKey(today),
    });
  },

  onShow() {
    this.loadNotes();
  },

  loadNotes() {
    const notes = wx.getStorageSync(STORAGE_KEY) || [];
    const notesByDate = notes.reduce((result, note) => {
      const dateKey = note.noteDate || this.formatDateKey(new Date(note.updatedAt || Date.now()));
      if (!result[dateKey]) result[dateKey] = [];
      result[dateKey].push(note);
      return result;
    }, {});

    this.setData({ notesByDate }, () => this.buildCalendar());
  },

  buildCalendar() {
    const { year, month, selectedDate, notesByDate } = this.data;
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const leadingDays = firstDay.getDay();
    const calendarDays = [];

    for (let i = 0; i < leadingDays; i += 1) {
      calendarDays.push({ key: `empty-${i}`, day: "", isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month - 1, day);
      const dateKey = this.formatDateKey(date);
      const notes = notesByDate[dateKey] || [];
      calendarDays.push({
        key: dateKey,
        day,
        dateKey,
        isCurrentMonth: true,
        isToday: dateKey === this.data.todayKey,
        isSelected: dateKey === selectedDate,
        noteCount: notes.length,
      });
    }

    this.setData({
      calendarDays,
      monthTitle: `${year}年${month}月`,
    }, () => this.updateSelectedNotes());
  },

  updateSelectedNotes() {
    const selectedNotes = this.data.notesByDate[this.data.selectedDate] || [];
    this.setData({
      selectedNotes,
      selectedDateText: this.formatDateText(this.data.selectedDate),
      agendaCountText: selectedNotes.length ? `${selectedNotes.length} 条备忘录` : "暂无备忘录",
    });
  },

  selectDate(e) {
    const dateKey = e.currentTarget.dataset.date;
    if (!dateKey) return;
    this.setData({ selectedDate: dateKey }, () => this.buildCalendar());
  },

  prevMonth() {
    this.shiftMonth(-1);
  },

  nextMonth() {
    this.shiftMonth(1);
  },

  shiftMonth(offset) {
    const date = new Date(this.data.year, this.data.month - 1 + offset, 1);
    const selectedDay = Math.min(
      Number(this.data.selectedDate.slice(-2)) || 1,
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    );
    const selectedDate = this.formatDateKey(new Date(date.getFullYear(), date.getMonth(), selectedDay));

    this.setData({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      selectedDate,
    }, () => this.buildCalendar());
  },

  goToday() {
    const today = new Date();
    this.setData({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      selectedDate: this.formatDateKey(today),
      todayKey: this.formatDateKey(today),
    }, () => this.buildCalendar());
  },

  createNote() {
    wx.navigateTo({ url: `/pages/edit/edit?date=${this.data.selectedDate}` });
  },

  editNote(e) {
    wx.navigateTo({ url: `/pages/edit/edit?id=${e.currentTarget.dataset.id}` });
  },

  formatDateKey(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  },

  formatDateText(dateKey) {
    const [year, month, day] = dateKey.split("-");
    return `${year}年${Number(month)}月${Number(day)}日`;
  },
});
