import { create } from 'zustand';

const getWeeksInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = new Date(start);
    const weeks = [];
    let week = [];
    let weekIndex = 1;

    current.setDate(current.getDate() - current.getDay());

    while (current <= end || week.length > 0) {
        const day = new Date(current);
        const isInMonth = day.getMonth() === month;
        const isFutureOrToday = day >= today;

        week.push(isInMonth && isFutureOrToday ? day : null);

        if (week.length === 7) {
            if (week.some((d) => d !== null)) {
                const filtered = week.map((d) => (d && d.getMonth() === month && d >= today ? d : null));
                const visible = filtered.filter(Boolean);
                weeks.push({
                    id: weekIndex++,
                    label: `Week ${weeks.length + 1}`,
                    dateRange: `${visible[0].getDate().toString().padStart(2, '0')} ${visible[0].toLocaleString('default', { month: 'short' })} - ${visible.at(-1).getDate().toString().padStart(2, '0')} ${visible.at(-1).toLocaleString('default', { month: 'short' })}`,
                    days: filtered,
                });
            }
            week = [];
        }

        current.setDate(current.getDate() + 1);
    }

    return weeks;
}

export const useOrderStore = create((set, get) => ({
    monthYear: new Date(),
    setMonthYear: (value) => set({ monthYear: value }),

    orderDetails: {
        order_no: '',
        order_type: 'dineIn',
        membership_type: '',
        member: null,
        person_count: 1,
        waiter: null,
        table: '',
        floor: '',
        date: new Date(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        order_items: [],
        order_status: 'pending',
    },

    setInitialOrder: ({ orderNo, memberTypes, floorTables }) =>
        set((state) => ({
            orderDetails: {
                ...state.orderDetails,
                order_no: orderNo,
                membership_type: memberTypes[0]?.id ?? '',
                floor: floorTables[0]?.id ?? '',
            },
        })),

    handleOrderDetailChange: (key, value) =>
        set((state) => ({
            orderDetails: {
                ...state.orderDetails,
                [key]: value,
            },
        })),

    handleOrderTypeChange: (value) => {
        const { orderDetails, handleOrderDetailChange } = get();
        if (value === null || value === orderDetails.order_type) return;
        handleOrderDetailChange('order_type', value);
        handleOrderDetailChange('member', '');
    },

    weeks: [],
    selectedWeek: null,

    initWeeks: () => {
        const { monthYear } = get();
        const newWeeks = getWeeksInMonth(monthYear);
        set({
            weeks: newWeeks,
            selectedWeek: newWeeks[0]?.id || null,
        });
    },

    handleWeekChange: (id) => {
        const { weeks, handleOrderDetailChange } = get();
        set({ selectedWeek: id });
        const week = weeks.find((w) => w.id === id);
        if (week) {
            handleOrderDetailChange('date', week.days[0]);
        }
    }
}));
