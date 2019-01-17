import React from 'react'
import classnames from 'classnames'
import _ from 'lodash'
import {IOrganizationMembers} from '../../Organizations/Organization'
import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
const FormItem = Form.Item
import Input from 'antd/lib/input'
const InputGroup = Input.Group
const styles = require('../Team.less')
import Icon from 'antd/lib/icon'
const utilStyles =  require('../../../assets/less/util.less')


interface IAddFormProps {
  ref: (f: any) => void
  form: any
  category: string
  organizationOrTeam: { name?: string }
  currentOrganizationProjects?: any
  handleSearchMember?: () => any
  inviteMemberList?: any
  addHandler: () => any
  currentOrganizationMembers: IOrganizationMembers[]
}

interface IAddFormStates {
  visible: boolean
  isDisabled: boolean
  inviteMemberInputValue: string
}

export class AddForm extends React.PureComponent<IAddFormProps, IAddFormStates> {
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      isDisabled: true,
      inviteMemberInputValue: ''
    }
  }
  public componentDidMount () {
    this.setState({
      visible: true
    })
  }
  private tips = (type: string) => {
    switch (type) {
      case 'teamMember':
        return '添加一个组织成员到当前团队'
      case 'project':
        return '只能添加您具有管理员权限的项目'
      case 'member':
        return '邀请一个成员加入当前组织，需要该成员确认邮件。'
      case 'team':
        return '邀请一个团队到当前团队下级'
      default:
        return ''
    }
  }

  private submitText = (type: string) => {
    switch (type) {
      case 'project':
        return '添加项目'
      case 'member':
        return '邀请成员'
      case 'teamMember':
        return '添加成员'
      case 'team':
        return '添加团队'
      default:
        return ''
    }
  }

  private selectOption = (target) => () => {
    const { name, id, username, user } = target
    this.setState({
      visible: true,
      isDisabled: false
    }, () => {
      if (user && user.username) {
        this.props.form.setFieldsValue({
          searchValue: user.username,
          projectId: user.id
        })
      } else {
        this.props.form.setFieldsValue({
          searchValue: name ? name : username,
          projectId: id
        })
      }
    })
  }

  private change = _.debounce((e) => {
    const { category, inviteMemberList, currentOrganizationMembers, handleSearchMember } = this.props

    this.setState({
      visible: false,
      inviteMemberInputValue: e.target.value
    })

    if (category === 'member') {
      if (inviteMemberList) {
        const currentList = inviteMemberList.find((list) => list.username === e.target.value)
        this.setState({
          isDisabled: currentList ? false : true
        })
      }
      handleSearchMember()
    }
    if (category === 'teamMember' && currentOrganizationMembers.length) {
      const currentList = currentOrganizationMembers.find((list) => list.user.username === e.target.value)
      this.setState({
        isDisabled: currentList ? false : true
      })
    }
  }, 300)

  private debouncedChange = (e) => {
    e.persist()
    this.change(e)
  }

  private bootstrapOptionsLi = (searchLi, data) => {
    const Options =  data ? data.slice(0, 20).map((o) => {
      if (o && o.user) {
        return (
          <li key={o.id} className={searchLi} onClick={this.selectOption(o)}>
              <span className={styles.main}>
                <img className={styles.avatar} src={o.user && o.user.avatar ? o.user.avatar : ''} alt=""/>
                <span className={styles.mainText}>
                  {o && o.user && o.user.username ? o.user.username : ''}
                </span>
              </span>
            <Icon type="plus" className={styles.iconPlus}/>
          </li>
        )
      } else {
        return (
          <li key={o.id} className={searchLi} onClick={this.selectOption(o)}>
            <span className={styles.main}>
              <img className={styles.avatar} src={o.user && o.user.avatar ? o.user.avatar : ''} alt=""/>
              <span className={styles.mainText}>
                {o.name ? o.name : o.username}
              </span>
            </span>
            <Icon type="plus" className={styles.iconPlus}/>
          </li>
        )
      }
    }) : ''
    return (
      <ul className={styles.searchItems}>
        {Options}
        {
          this.props.category === 'team' ?
            <li key="createNew" className={searchLi} onClick={this.props.addHandler}>
              <span className={styles.create}>
                创建
              </span>
              <Icon type="plus" className={styles.iconPlus}/>
            </li> : ''
        }
      </ul>
    )
  }

  public render () {
    const {
      category,
      inviteMemberList,
      organizationOrTeam,
      currentOrganizationMembers,
      currentOrganizationProjects
    } = this.props

    const {
      isDisabled,
      inviteMemberInputValue
    } = this.state

    const searchLi = classnames({
      [styles.searchLi]: true,
      [utilStyles.hide]: this.state.visible
    })
    let optionList = void 0
    if (category === 'project' && currentOrganizationProjects) {
      optionList = this.bootstrapOptionsLi(searchLi, currentOrganizationProjects)
    } else if (category === 'member' && inviteMemberInputValue !== '') {
      optionList = this.bootstrapOptionsLi(searchLi, inviteMemberList)
    } else if (category === 'teamMember' && inviteMemberInputValue !== '') {
      optionList = this.bootstrapOptionsLi(searchLi, currentOrganizationMembers)
    }

    const orgOrTeamName = organizationOrTeam ? organizationOrTeam.name : ''
    const {getFieldDecorator} = this.props.form
    return (
      <div className={styles.addFormWrapper}>
        <div className={styles.titleWrapper}>
          <div className={styles.icon}>
            <Icon type="user"/>
          </div>
          <div className={styles.title}>
            添加{category}到<span className={styles.orgName}>{orgOrTeamName}</span>
          </div>
          <div className={styles.tips}>
            {this.tips(category)}
          </div>
        </div>
        <div className={styles.search}>
          <Form>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('projectId', {
              })(
                <Input />
              )}
            </FormItem>
            <FormItem>
              <InputGroup size="large" compact>
                {getFieldDecorator('searchValue', {
                  initialValue: '',
                  onChange: this.debouncedChange
                })(
                  <Input style={{width: '65%'}} autoComplete="off"/>
                )}
                <Button className={styles.plusBtn}  type="primary" size="large" onClick={this.props.addHandler} disabled={isDisabled}>
                  {this.submitText(category)}<Icon type="plus"/>
                </Button>
                {optionList}
              </InputGroup>
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}

export default Form.create()(AddForm)



