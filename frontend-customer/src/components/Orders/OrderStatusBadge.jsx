import { STATUS_STYLES, ORDER_STEPS } from "../../constants/orderConstants";

const OrderStatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.placed;
  const label = ORDER_STEPS.find((s) => s.key === status)?.label || status;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {label}
    </span>
  );
};

export default OrderStatusBadge;