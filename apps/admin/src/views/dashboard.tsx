import type { EChartsOption } from 'echarts';
import { useState } from 'react';
import bell from '@/assets/images/dashboard/bell.svg';
import cake from '@/assets/images/dashboard/cake.svg';
import card from '@/assets/images/dashboard/card.svg';
import download from '@/assets/images/dashboard/download.svg';
import { DashboardChart } from './dashboard-chart';

type DashboardTab = 'trends' | 'visits';

const overviewItems = [
  { icon: card, title: '用户量', totalTitle: '总用户量', totalValue: '120,000', value: '2,000' },
  { icon: cake, title: '访问量', totalTitle: '总访问量', totalValue: '500,000', value: '20,000' },
  { icon: download, title: '下载量', totalTitle: '总下载量', totalValue: '120,000', value: '8,000' },
  { icon: bell, title: '使用量', totalTitle: '总使用量', totalValue: '50,000', value: '5,000' },
];

const chartOptions: Record<DashboardTab | 'data' | 'sales' | 'source', EChartsOption> = {
  trends: {
    grid: { bottom: 0, containLabel: true, left: '1%', right: '1%', top: '2 %' },
    series: [
      { areaStyle: {}, data: [111, 2000, 6000, 16000, 33333, 55555, 64000, 33333, 18000, 36000, 70000, 42444, 23222, 13000, 8000, 4000, 1200, 333, 222, 111], itemStyle: { color: '#5ab1ef' }, smooth: true, type: 'line' },
      { areaStyle: {}, data: [33, 66, 88, 333, 3333, 6200, 20000, 3000, 1200, 13000, 22000, 11000, 2221, 1201, 390, 198, 60, 30, 22, 11], itemStyle: { color: '#019680' }, smooth: true, type: 'line' },
    ],
    tooltip: { axisPointer: { lineStyle: { color: '#019680', width: 1 } }, trigger: 'axis' },
    xAxis: { axisTick: { show: false }, boundaryGap: false, data: Array.from({ length: 18 }, (_item, index) => `${index + 6}:00`), splitLine: { lineStyle: { type: 'solid', width: 1 }, show: true }, type: 'category' },
    yAxis: [{ axisTick: { show: false }, max: 80000, splitArea: { show: true }, splitNumber: 4, type: 'value' }],
  },
  visits: {
    grid: { bottom: 0, containLabel: true, left: '1%', right: '1%', top: '2 %' },
    series: [{ barMaxWidth: 80, data: [3000, 2000, 3333, 5000, 3200, 4200, 3200, 2100, 3000, 5100, 6000, 3200, 4800], type: 'bar' }],
    tooltip: { axisPointer: { lineStyle: { width: 1 } }, trigger: 'axis' },
    xAxis: { data: Array.from({ length: 12 }, (_item, index) => `${index + 1}月`), type: 'category' },
    yAxis: { max: 8000, splitNumber: 4, type: 'value' },
  },
  data: {
    legend: { bottom: 0, data: ['访问', '趋势'] },
    radar: { indicator: ['网页', '移动端', 'Ipad', '客户端', '第三方', '其它'].map(name => ({ name })), radius: '60%', splitNumber: 8 },
    series: [{ areaStyle: { opacity: 1, shadowBlur: 0, shadowColor: 'rgba(0,0,0,.2)', shadowOffsetX: 0, shadowOffsetY: 10 }, data: [{ itemStyle: { color: '#b6a2de' }, name: '访问', value: [90, 50, 86, 40, 50, 20] }, { itemStyle: { color: '#5ab1ef' }, name: '趋势', value: [70, 75, 70, 76, 20, 85] }], itemStyle: { borderRadius: 10, borderWidth: 2 }, symbolSize: 0, type: 'radar' }],
    tooltip: {},
  },
  source: {
    legend: { bottom: '2%', left: 'center' },
    series: [{ animationDelay: () => Math.random() * 100, animationEasing: 'exponentialInOut', animationType: 'scale', avoidLabelOverlap: false, color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9'], data: [{ name: '搜索引擎', value: 1048 }, { name: '直接访问', value: 735 }, { name: '邮件营销', value: 580 }, { name: '联盟广告', value: 484 }], emphasis: { label: { fontSize: '12', fontWeight: 'bold', show: true } }, itemStyle: { borderRadius: 10, borderWidth: 2 }, label: { position: 'center', show: false }, labelLine: { show: false }, name: '访问来源', radius: ['40%', '65%'], type: 'pie' }],
    tooltip: { trigger: 'item' },
  },
  sales: {
    series: [{ animationDelay: () => Math.random() * 400, animationEasing: 'exponentialInOut', animationType: 'scale', center: ['50%', '50%'], color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9'], data: [{ name: '技术支持', value: 274 }, { name: '定制', value: 310 }, { name: '远程', value: 400 }, { name: '外包', value: 500 }], name: '商业占比', radius: '80%', roseType: 'radius', type: 'pie' }],
    tooltip: { trigger: 'item' },
  },
};

export function DashboardView() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('trends');

  return (
    <div className="dashboard-page dashboard-analysis">
      <section aria-label="概览数据" className="analysis-overview">
        {overviewItems.map(({ icon, title, totalTitle, totalValue, value }) => (
          <article className="analysis-card analysis-overview-card" key={title}>
            <header><h2>{title}</h2></header>
            <div className="analysis-overview-card__value">
              <strong>{value}</strong>
              <img alt="" src={icon} />
            </div>
            <footer>
              <span>{totalTitle}</span>
              <b>{totalValue}</b>
            </footer>
          </article>
        ))}
      </section>

      <section aria-label="访问趋势" className="analysis-card analysis-chart-tabs">
        <div aria-label="图表类型" className="analysis-tab-list" role="tablist">
          <button aria-selected={activeTab === 'trends'} onClick={() => setActiveTab('trends')} role="tab" type="button">流量趋势</button>
          <button aria-selected={activeTab === 'visits'} onClick={() => setActiveTab('visits')} role="tab" type="button">月访问量</button>
        </div>
        <DashboardChart label={activeTab === 'trends' ? '流量趋势图' : '月访问量图'} option={chartOptions[activeTab]} />
      </section>

      <section aria-label="访问分析" className="analysis-chart-grid">
        <article className="analysis-card analysis-chart-card">
          <h2>访问数量</h2>
          <div className="analysis-chart-card__content">
            <DashboardChart label="访问数量雷达图" option={chartOptions.data} />
          </div>
        </article>
        <article className="analysis-card analysis-chart-card">
          <h2>访问来源</h2>
          <div className="analysis-chart-card__content">
            <DashboardChart label="访问来源图" option={chartOptions.source} />
          </div>
        </article>
        <article className="analysis-card analysis-chart-card">
          <h2>访问来源</h2>
          <div className="analysis-chart-card__content">
            <DashboardChart label="商业占比图" option={chartOptions.sales} />
          </div>
        </article>
      </section>
    </div>
  );
}
