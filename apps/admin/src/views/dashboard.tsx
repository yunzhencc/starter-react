export function DashboardView() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">概览</p>
          <h1>数据分析</h1>
          <p>今日业务运行平稳，较上周同期增长 12.8%。</p>
        </div>
        <button className="dashboard-action" type="button">导出报告</button>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>用户量</span>
          <strong>2,000</strong>
          <small>
            总用户量
            <b>120,000</b>
          </small>
        </article>
        <article className="metric-card">
          <span>访问量</span>
          <strong>20,000</strong>
          <small>
            总访问量
            <b>500,000</b>
          </small>
        </article>
        <article className="metric-card">
          <span>下载量</span>
          <strong>8,000</strong>
          <small>
            总下载量
            <b>120,000</b>
          </small>
        </article>
        <article className="metric-card">
          <span>使用量</span>
          <strong>5,000</strong>
          <small>
            总使用量
            <b>50,000</b>
          </small>
        </article>
      </div>

      <section className="trend-card">
        <div className="trend-card-header">
          <div>
            <h2>流量趋势</h2>
            <p>过去 7 天的访问趋势</p>
          </div>
          <span className="trend-badge">+12.8%</span>
        </div>
        <div className="trend-chart" aria-label="过去 7 天的访问趋势图">
          <i style={{ height: '38%' }} />
          <i style={{ height: '55%' }} />
          <i style={{ height: '46%' }} />
          <i style={{ height: '76%' }} />
          <i style={{ height: '64%' }} />
          <i style={{ height: '88%' }} />
          <i style={{ height: '72%' }} />
        </div>
      </section>
    </div>
  );
}
