package controllers

import de.htwg.se.orderandchaos.OrderAndChaos
import de.htwg.se.orderandchaos.control.{Control, FieldSet, Win}

import javax.inject._
import play.api.mvc._

import scala.swing.Reactor
import scala.util.{Failure, Success, Try}


@Singleton
class GameController @Inject()(cc: ControllerComponents) extends AbstractController(cc) with Reactor{
  val control: Control = OrderAndChaos.control

  listenTo(control)

  def set(x: String, y: String, value: String): Action[AnyContent] = Action {
    val error = getError(() => control.play(x.toInt, y.toInt, value))
    Ok(views.html.orderandchaos(control.controller, error))
  }

  def undo(): Action[AnyContent] = Action {
    val error = getError(() => control.undo())
    Ok(views.html.orderandchaos(control.controller, error))
  }

  def redo(): Action[AnyContent] = Action {
    val error = getError(() => control.redo())
    Ok(views.html.orderandchaos(control.controller, error))
  }

  def reset(): Action[AnyContent] = Action {
    val error = getError(() => control.reset())
    Ok(views.html.orderandchaos(control.controller, error))
  }

  def display: Action[AnyContent] = Action {
    Ok(views.html.orderandchaos(control.controller, ""))
  }

  def about: Action[AnyContent] = Action {
    Ok(views.html.index())
  }

  private def getError(f: () => Unit): String = Try(f()) match {
    case Success(_) => ""
    case Failure(e) => e.getMessage
  }
}
