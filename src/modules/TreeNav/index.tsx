import React, { SyntheticEvent } from 'react'
import { Box, colors, styled, Typography } from '@mui/material'
import { TreeItem, treeItemClasses, TreeItemProps, TreeView } from '@mui/lab'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Label from '@mui/icons-material/Label'
import { SingleSelectTreeViewProps } from '@mui/lab/TreeView/TreeView'
import { Context, Task } from '@/common/api/context'


interface TaskTreeItemProps extends TreeItemProps {
  text: string
  duration: number
  timeRequired: number
}

const TaskTreeItem = ({ text, duration, timeRequired, ...other }: TaskTreeItemProps) => {

  const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
    [`& .${treeItemClasses.content}`]: {
      padding: 0,
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
      [`& .${treeItemClasses.label}`]: {
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    [`& .${treeItemClasses.expanded} .duration`]: {
      fontWeight: 'bold',
    },
  }))

  let timeColor: string
  if (duration > 0) timeColor = colors.blue[500]
  else if (duration < 0) timeColor = colors.red[500]
  else timeColor = 'inherit'

  return (
    <StyledTreeItem
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 1 }}>
          <Box component={Label} color="inherit" sx={{ mr: 2 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 'inherit', flexGrow: 1 }}
          >{text}
          </Typography>
          <Typography
            className="duration"
            variant="caption"
            color={timeColor}
          >{timeRequired - duration}/{timeRequired}
          </Typography>
        </Box>
      }
      {...other}
    />
  )
}

interface Props extends SingleSelectTreeViewProps {
  context: Context
  onTaskSelect: (task: Task) => void
}

export default function TreeNav({ context, onTaskSelect, ...other }: Props) {

  const calcSum = <T, >(arr: T[], cb: (t: T) => number): number => arr.map(v => cb(v)).reduce((a, b) => a + b, 0)
  const categoryList = [
    {
      id: 'daily',
      text: 'Daily',
      tasks: context.dailyTasks,
    }, {
      id: 'weekly',
      text: 'Weekly',
      tasks: context.weeklyTasks,
    }, {
      id: 'longTerm',
      text: 'Long Term',
      tasks: context.longTermTasks,
    },
  ]

  const nodeSelect = (_: SyntheticEvent, node: string) => {
    const task = context.taskMap.get(Number(node))
    if (task) {
      onTaskSelect(task)
    }
  }

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      onNodeSelect={nodeSelect}
      {...other}
    >
      {
        categoryList.map(({ id, text, tasks }) =>
          <TaskTreeItem
            key={id}
            nodeId={id}
            text={text}
            duration={calcSum(tasks, t => t.duration)}
            timeRequired={calcSum(tasks, t => t.timeRequired)}
          >
            {
              tasks.map(task =>
                <TaskTreeItem
                  key={task.id}
                  nodeId={task.id.toString()}
                  text={task.title}
                  duration={task.duration}
                  timeRequired={task.timeRequired}
                />)
            }
          </TaskTreeItem>)
      }
    </TreeView>
  )
}
