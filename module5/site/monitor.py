#!/usr/bin/env python
#-*- coding: utf-8 -*-

import os
import sys
from fnmatch import fnmatch
import subprocess
from time import ctime
from optparse import OptionParser
import sched, time

def periodic(scheduler, interval, action, actionargs=()):
    scheduler.enter(interval, 1, periodic, (scheduler, interval, action, actionargs))
    action(*actionargs)

class Monitor(object):

    def __init__(self, directory, commands, patterns_file):
        self.old_sum = 0
        self.directory = directory
        self.commands = commands
        self.patterns = self._get_patterns(patterns_file)
	s = sched.scheduler(time.time, time.sleep)
	periodic(s, 1, self.check)
	s.run()

    def _get_patterns(self, patterns_file):
        try:
            with open(patterns_file, 'r') as f:
                patterns = [pattern.strip() for pattern in  f.readlines()]
        except IOError:
            sys.stdout.write(
                'Could not find %s. Patterns will not be ignored\n'
                % patterns_file
            )
            patterns = []

        patterns += [os.path.basename(patterns_file)]

        return patterns

    def _filter_files(self, files):
        for p in self.patterns:
            files = [f for f in files if not fnmatch(f, p)]
        return files


    def run_command(self, test_cmd):
        process = subprocess.Popen(
            test_cmd,
            shell = True,
            cwd = self.directory,
            stdout = subprocess.PIPE,
            stderr = subprocess.PIPE,
        )

        output = process.stdout.read()
        output += process.stderr.read()
        status = process.wait()
	print(output)

    def check(self):
        m_time_list = []
        for root, dirs, files in os.walk(self.directory):
            if '.git' in root:
                continue
            files = self._filter_files(files)
            m_time_list += [
                os.stat(os.path.join(root, f)).st_mtime for f in files
            ]

        new_sum = sum(m_time_list)
        if new_sum != self.old_sum:
            for command in self.commands:
                self.run_command(command)
            self.old_sum = new_sum

        return True


def parse_options():
    usage = "%prog [OPTIONS] COMMAND ..."
    description = """
        %prog watches a directory for changes. As soon as there are any changes
        to the files being watched, it runs the commands specified as positional
        arguments. You can specify as many commands as you wish, but don't forget
        to use quotes if you command has spaces in it.
    """.replace('  ', '')
    parser = OptionParser(usage, description=description)
    parser.add_option(
        '-d',
        '--directory',
        action = 'store',
        type = 'string',
        dest = 'directory',
        help = 'Watch DIRECTORY',
        metavar = 'DIRECTORY',
        default = os.path.abspath(os.path.curdir)
    )

    parser.add_option(
        '-p',
        '--patterns_file',
        action = 'store',
        type = 'string',
        dest = 'patterns_file',
        help = (
            'Defines the file with patterns to ignore. '
        ),
        metavar = 'PATTERNS_FILE',
        default = None,
    )
    return parser.parse_args()


if __name__ == '__main__':

    options, args = parse_options()

    if options.patterns_file == None:
        options.patterns_file = os.path.join(
            options.directory,
            '.dojoignore'
        )

    try:
        print 'Monitoring files in %s' % options.directory
        print 'ignoring files in %s' % (options.patterns_file)
        print 'press ^C to quit'


        monitor = Monitor(
            directory = options.directory,
            commands = args,
            patterns_file = options.patterns_file,
        )


    except KeyboardInterrupt:
        print '\nleaving...'
        sys.exit(0)

