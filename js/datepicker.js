/**
 * 思路：
 * init()
 *   1. 开始时选中当前日期
 *   2. 展开日历的目标元素
 * render()
 *   1. 渲染元素
 */
function DatePicker ($target) {
  this.init($target)
  this.render() // 生成模板
  this.setData() /// 设置日期
  this.bind()
}

DatePicker.prototype = {
  init: function ($target) {
    this.$target = $target
    if (this.isValidDate(dateStr)) {
      var dateStr = $target.attr('date-init')
      this.date = new Date(dateStr) // 当前日期/指定展示的日期
      this.watchDate = new Date(dateStr) // 切换月份时看到的时期
    } else {
      this.date = new Date()
      this.watchDate = new Date()
    }
  },
  render: function () {
    // 模板添加到html中
    var tpl = `
    <div class="ui-date-picker" style="display: none">
      <div class="header">
        <span class="pre caret-left"></span>
        <span class="header-date"></span>
        <span class="next caret-right"></span>
      </div>
      <table class="panel">
        <thead>
        <tr>
          <th>日</th>
          <th>一</th>
          <th>二</th>
          <th>三</th>
          <th>四</th>
          <th>五</th>
          <th>六</th>
        </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>
    `
    this.$datepicker = $(tpl)
    // 插入dom
    this.$datepicker.insertAfter(this.$target)
      .css({
        'position': 'absolute',
        'left': this.$target.offset().left,
        'top': this.$target.offset().top + this.$target.height(true)
      })
  },
  isValidDate (dateStr) {
    return new Date(dateStr).toString() !== 'Invalid Date'
  },
  setData () {
    /**
     *  获取日期数组
     *  1. 根据当前时间，获取月份
     *  2. 月份第一天 周几，就知道前面的时间了
     *  3. 最后一天（后一月的第0天-24小时），周几，就知道后面的时间了
     */
    this.$datepicker.find('tbody').html('');
    var firstDay = this.getFirstDay(this.watchDate)
    var lastDay = this.getLastDay(this.watchDate)
    var year = firstDay.getFullYear()
    var month = firstDay.getMonth()

    // 构造日期数组
    var dateArr = [];

    // 上月日期：从当前周几遍历到周一
    for (var i = firstDay.getDay(); i > 0; i--) {
      var d = new Date(year, month, 1 - i)
      dateArr.push({ type: 'pre', date: d }) // 为了区分是本月还是下月，使用对象
    }

    // 本月日期
    for (var j = 1; j <= lastDay.getDate(); j++) {
      var d = new Date(year, month, j)
      dateArr.push({ type: 'cur', date: d })
    }

    // 下月一周剩余
    for (var k = 1; k < 7 - lastDay.getDay(); k++) {
      var d = new Date(year, month + 1, k);
      dateArr.push({ type: 'next', date: d })
    }

    this.$datepicker.find('.header-date').text(this.watchDate.getFullYear() + '年' + (this.watchDate.getMonth() + 1) + '月')

    var tpl = ''
    for (var i = 0; i < dateArr.length; i++) {
      if (i % 7 === 0) {
        tpl = '<tr>' + tpl;
      }

      tpl += '<td class="';

      if (dateArr[i].type === 'pre') {
        tpl += 'pre-month'
      } else if (dateArr[i].type === 'cur') {
        tpl += 'cur-month'
      } else {
        tpl += 'next-month'
      }

      // 判断是否是当前日期
      if (this.getYYMMDD(this.date) === this.getYYMMDD(dateArr[i].date)) {
        console.log(this.date)
        tpl += ' cur-date'
      }
      tpl += '"'

      // 自定义属性
      tpl += ' data-date="' + this.getYYMMDD(dateArr[i].date) + '">'

      tpl += this.toFixed(dateArr[i].date.getDate()) + '</td>'

      if (i % 7 === 6) {
        tpl = tpl + '</tr>'
      }
    }

    // 填充DOM
    this.$datepicker.find('tbody').html(tpl)
  },
  bind () {
    var self = this;
    // 前一个月的绑定事件
    this.$datepicker.find('.pre').on('click', function () {
      self.watchDate = self.getPreMonth(self.watchDate)
      self.setData() // 重渲数组
    })

    this.$datepicker.find('.next').on('click', function () {
      self.watchDate = self.getNextMonth(self.watchDate) // 这里是一个缓存日期
      self.setData()
    })

    this.$datepicker.on('click', '.cur-month', function () {
      self.$target.val($(this).attr('data-date'))
      self.$datepicker.hide();
    })

    this.$target.on('click', function (e) {
      e.stopPropagation()
      self.$datepicker.show()
    })

    // 点击页面其他部分隐藏，点击未绑定的部分无效
    this.$datepicker.on('click', function (e) {
      e.stopPropagation()
    })
    // 点击页面关闭
    $(window).on('click', function (e) {
      self.$datepicker.hide()
    })

  },
  // 获取给定日期的上月1号
  getPreMonth (date) {
    var year = date.getFullYear()
    var month = date.getMonth()

    month--
    if (month < 0) {
      month = 11
      year--
    }

    return new Date(year, month, 1)
  },
  getNextMonth (date) {
    var year = date.getFullYear()
    var month = date.getMonth()

    month++
    if (month > 11) {
      month = 0
      year++
    }
    return new Date(year, month, 1)
  },
  getFirstDay: function (date) {
    var year = date.getFullYear();
    var month = date.getMonth()

    return new Date(year, month, 1)
  },
  getLastDay: function (date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var newMonth = month++
    var newYear = year

    // 处理12月的情况
    if (month > 12) {
      newMonth -= 12
      newYear++
    }

    var newDate = new Date(newYear, newMonth, 1) // 获取下月的第一天
    return new Date(newDate.getTime() - 1000 * 60 * 60 * 24) // 本月最后一天
  },
  getYYMMDD: function (date) {
    var yy = date.getFullYear()
    var mm = date.getMonth() + 1
    return date.getFullYear() + "/" + this.toFixed(date.getMonth() + 1) + "/" + this.toFixed(date.getDate());
  },
  toFixed: function (n) {
    return (n + '').length === 1 ? ('0' + n + '') : (n + '');
  }
}