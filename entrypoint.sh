#!/bin/bash

# Start backend server
cd /app/backend && python server.py &

# Start frontend
cd /app/frontend && npm start
