import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const eventSchema = new Schema({
  session_id: { type: String, required: true },
  event_type: { type: String, enum: ['page_view', 'click'], required: true },
  page_url: { type: String, required: true },
  timestamp: { type: Date, required: true },
  x: {
    type: Number,
    required: function() {
      return this.event_type === 'click';
    }
  },
  y: {
    type: Number,
    required: function() {
      return this.event_type === 'click';
    }
  }
});

const Event = model('Event', eventSchema);

export default Event;
