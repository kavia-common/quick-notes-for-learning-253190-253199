#!/bin/bash
cd /home/kavia/workspace/code-generation/quick-notes-for-learning-253190-253199/frontend_quick_notes
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

