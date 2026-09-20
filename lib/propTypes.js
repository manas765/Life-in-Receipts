import PropTypes from "prop-types";

export const receiptShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  chapter: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  detail: PropTypes.string,
  tag: PropTypes.string,
  amount: PropTypes.number,
  currency: PropTypes.string,
  chainId: PropTypes.string,
  synthesized: PropTypes.bool,
});

export const chapterStatsShape = PropTypes.shape({
  receiptCount: PropTypes.number.isRequired,
  totalSpent: PropTypes.number.isRequired,
  topCategory: PropTypes.string.isRequired,
  listeningHours: PropTypes.number.isRequired,
  topArtist: PropTypes.string.isRequired,
  nightOwlPct: PropTypes.number.isRequired,
  totalPlays: PropTypes.number.isRequired,
});

export const chapterShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  years: PropTypes.string.isRequired,
  blurb: PropTypes.string.isRequired,
  stats: chapterStatsShape.isRequired,
});
