const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('zh-CN');

const percentFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export const formatDateTime = (value?: string | number | Date | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '-' : dateTimeFormatter.format(date);
};

export const formatDate = (value?: string | number | Date | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date);
};

export const formatNumber = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? numberFormatter.format(value) : '-';

export const formatPercent = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? percentFormatter.format(value) : '-';

export const formatDurationSeconds = (seconds?: number | null) => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) {
    return '-';
  }

  const minutes = Math.floor(seconds / 60);
  const restSeconds = Math.floor(seconds % 60);

  if (minutes <= 0) {
    return `${restSeconds}秒`;
  }

  return `${minutes}分${restSeconds.toString().padStart(2, '0')}秒`;
};
