import { useMemo } from 'react';

// NPV = Σ(CF_t / (1+r)^t) - C0
export function calcNPV(cashFlows, discountRate) {
  return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + discountRate, t), 0);
}

// IRR via bisection (NPV = 0)
export function calcIRR(cashFlows, tolerance = 1e-6, maxIter = 1000) {
  let lo = -0.999, hi = 10;
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    const npv = calcNPV(cashFlows, mid);
    if (Math.abs(npv) < tolerance) return mid;
    if (npv > 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// Payback period in fractional years
export function calcPayback(cashFlows) {
  let cum = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const prev = cum;
    cum += cashFlows[t];
    if (cum >= 0) {
      return t - prev / cashFlows[t]; // interpolate
    }
  }
  return null; // never pays back
}

export function useNPV({ initialInvestment, annualCashFlows, discountRate }) {
  return useMemo(() => {
    const cfs = [-initialInvestment, ...annualCashFlows];
    const npv = calcNPV(cfs, discountRate);
    const irr = calcIRR(cfs);
    const payback = calcPayback(cfs);
    const totalReturns = annualCashFlows.reduce((a, b) => a + b, 0);
    const roi = ((totalReturns - initialInvestment) / initialInvestment) * 100;
    const moic = (totalReturns + initialInvestment) / initialInvestment;

    // Cumulative cash flow series for chart
    const cumulative = cfs.reduce((acc, cf, i) => {
      acc.push((acc[i - 1] || 0) + cf);
      return acc;
    }, []);

    return { npv, irr, payback, roi, moic, cumulative, totalReturns };
  }, [initialInvestment, annualCashFlows, discountRate]);
}
