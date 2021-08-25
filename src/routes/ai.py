from typing import Text
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer
import sys
bot = ChatBot('Training Example')

'''
This is an example showing how to create an export file from
an existing chat bot that can then be used to train other bots.
'''

chatbot = ChatBot('Export Example Bot')

# First, lets train our bot with some data
trainer = ChatterBotCorpusTrainer(chatbot)

#trainer.train('chatterbot.corpus.english')

# Now we can export the data to a file
#trainer.export_for_training('./my_export.json')
response = chatbot.get_response(sys.argv[1])
print(response)